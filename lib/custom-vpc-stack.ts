import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
// import * as ecs from 'aws-cdk-lib/aws-ecs'
import { Construct } from 'constructs';
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
  }
}
