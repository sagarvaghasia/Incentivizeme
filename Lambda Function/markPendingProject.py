import json
import boto3
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('projects')

def lambda_handler(event, context):
    requestJSON = json.loads(event['body'])
    project_id = requestJSON['id']
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST'
    }
    try:
        response = table.update_item(
            Key={
                'id': project_id
            },
            UpdateExpression='SET #s = :status',
            ExpressionAttributeNames={
                '#s': 'status'
            },
            ExpressionAttributeValues={
                ':status': 'pending'
            },
            ReturnValues="ALL_NEW"
        )
        attendance_table = dynamodb.Table('attendances')
        attendances = attendance_table.scan(
            FilterExpression='projectId.id = :id',
            ExpressionAttributeValues={
                ':id': project_id
            }
        )
        
        for attendance in attendances['Items']:
            hours_worked = float(attendance['hours'])
            if attendance.get('Bonus'):
                attendance_table.update_item(
                    Key={
                        'id': attendance['id']
                    },
                    UpdateExpression='SET Bonus = :Bonus',
                    ExpressionAttributeValues={
                        ':Bonus': 0
                    }
                )
            
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response, cls=DecimalEncoder)
        }
    except dynamodb.meta.client.exceptions.ClientError as e:
        error_message = e.response['Error']['Message']
        return {
            'statusCode': 404,
            'body': json.dumps({'error': error_message})
        }
