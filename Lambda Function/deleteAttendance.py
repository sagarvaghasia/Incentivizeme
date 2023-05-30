import json
import boto3

dynamo = boto3.resource('dynamodb').Table('attendances')

def lambda_handler(event, context):
    body = ''
    statusCode = 200
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }
    
    try:
        print("event data: " + json.dumps(event))
        id = event['pathParameters']['id']
        dynamo.delete_item(Key={'id': id})
    
    except Exception as e:
        statusCode = 400
        body = str(e)
    
    finally:
        body = json.dumps(body)
    
    return {
        'statusCode': statusCode,
        'body': body,
        'headers': headers
    }