import json
import boto3
import decimal

dynamo = boto3.resource('dynamodb').Table('attendances')
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)
        
def lambda_handler(event, context):
    statusCode = 200
    body = ''
    headers = {
        "Content-Type": "application/json",
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
    }
    
    try:
        print("event data: " + json.dumps(event))
        response = dynamo.scan()
        body = response['Items']
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