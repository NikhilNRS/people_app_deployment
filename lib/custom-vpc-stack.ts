import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling'
import { Construct } from 'constructs';
import { TaskDefinition } from 'aws-cdk-lib/aws-ecs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CustomVpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new ec2.Vpc(this, "people-app-vpc", {

      subnetConfiguration: [
        // this.region
        {
          name: "public-subnet",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask:24
        },
        {
          name: "private-subnet",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask:24
        },
        {
          name: "private-subnet-isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask:24
        }
      ]
    });


    // example resource
    // const queue = new sqs.Queue(this, 'CustomVpcQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const cluster = new ecs.Cluster(
      this,
      "PeopleAppEcsCluster",
      { vpc }
    );

    const autoScalingGroup = new autoscaling.AutoScalingGroup(
      this,
      "PeoAutoScaleGrp", {
        vpc,
        instanceType: new ec2.InstanceType('t2.micro'),
        minCapacity: 2,
        maxCapacity: 3,
        machineImage: ecs.EcsOptimizedImage.amazonLinux(),
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
        }
      }
    );
    const capacityProvider = new ecs.AsgCapacityProvider(this, 'AsgCapacityProvider', {
      autoScalingGroup,
    });
    cluster.addAsgCapacityProvider(capacityProvider);

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDef');

    taskDefinition.addContainer("people_app_container", {

      image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
      memoryLimitMiB: 256
      
    })

    new ecs.Ec2Service(this, 'EC2Service', {
      cluster,
      taskDefinition,
      capacityProviderStrategies: [
        {
          capacityProvider: capacityProvider.capacityProviderName,
          weight: 1,
        },
      ],
    });
  }
}
