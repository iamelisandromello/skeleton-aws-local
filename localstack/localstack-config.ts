import { variables } from '../src/main/variables'

export const checkIsEnabled = {
  s3: variables.checkLocalstack.s3,
  sqs: variables.checkLocalstack.sqs,
  lambda: variables.checkLocalstack.lambda,
  apigateway: variables.checkLocalstack.apigateway,
  dynamodb: variables.checkLocalstack.dynamodb,
  cloudwatch: variables.checkLocalstack.cloudwatch,
  sns: variables.checkLocalstack.sns,
  kinesis: variables.checkLocalstack.kinesis
}
