import "source-map-support/register";

export const basicAuthorizer = async (event, _context, callback) => {
  console.log("Event: ", JSON.stringify(event));

  const generatePolicy = (principalId, resource, effect = "Allow") => {
    return {
      principalId,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: resource,
          },
        ],
      },
    };
  };

  if (event["type"] !== "TOKEN") callback("Unauthorized");

  try {
    const authToken = event.authorizationToken;
    const encodedCreds = authToken.split(" ")[1];
    const buff = Buffer.from(encodedCreds, "base64");
    const plainCreds = buff.toString("utf-8").split(":");
    const username = plainCreds[0];
    const password = plainCreds[1];

    console.log(`username: ${username} and password ${password}`);

    const storedUserPassword = process.env[username];
    console.log(storedUserPassword);
    const effect =
      !storedUserPassword || storedUserPassword != password ? "Deny" : "Allow";

    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    console.log(JSON.stringify(policy));

    callback(null, policy);
  } catch (e) {
    callback(`Unauthorized ${e.message}`);
  }
};
