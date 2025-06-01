import { variables } from '../src/main/variables'

export const checkIsEnabled = {
  s3: variables.checkLocalStackS3,
  sqs: variables.checkLocalStackSqs,
  lambda: variables.checkLocalStackLambda,
  apigateway: variables.checkLocalStackApiGateway,
  dynamodb: variables.checkLocalStackDynamoDb,
  cloudwatch: variables.checkLocalStackCloudWatch,
  sns: variables.checkLocalStackSns,
  kinesis: variables.checkLocalStackKinesis
}
