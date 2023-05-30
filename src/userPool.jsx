import { CognitoUserPool } from  "amazon-cognito-identity-js";

const poolData = { 
    UserPoolId: "us-east-1_M2fK8yx8J",
    ClientId: "4uutotbke7o6vuean7lc8h7q1h"
}

export default new CognitoUserPool(poolData);