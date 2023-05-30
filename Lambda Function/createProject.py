import json
import boto3
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)
        
dynamo = boto3.resource('dynamodb').Table('projects')

def lambda_handler(event, context):
    body = ''
    statusCode = 200
    headers = {
        "Content-Type": "application/json",
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }
    
    try:
        print("event data: " + json.dumps(event))
        
        requestJSON = json.loads(event['body'])
        
        dynamo.put_item(Item={
            'id': requestJSON['id'],
            'name': requestJSON['name'],
            'status':requestJSON['status'],
            'managerId':requestJSON.get('managerId',{}),
            'budgetAmount':requestJSON['budgetAmount'],
        })
        
        
        # Create an SNS client
        sns = boto3.client('sns')
        
        # Get the ARN of the SNS topic to subscribe to
        topic_arn = 'arn:aws:sns:us-east-1:539789115280:incentvieme'
        
        # Subscribe to the SNS topic
        sns.subscribe(
            TopicArn=topic_arn,
            Protocol='email',
            Endpoint=requestJSON.get('managerId',{}).get('email')
        )
        
        # Publish a message to the SNS topic
        message = {'default': 'Your project has been successfully added to the projects dashboard'}
        sns.publish(
            TopicArn=topic_arn,
            Message=json.dumps(message),
            MessageStructure='json'
        )
        
        
        
        body = requestJSON
    
    except Exception as e:
        statusCode = 400
        body = str(e)
    
    finally:
        body = json.dumps(body,cls=DecimalEncoder)
    
    return {
        'statusCode': statusCode,
        'body': body,
        'headers': headers
    }