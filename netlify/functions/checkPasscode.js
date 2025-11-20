exports.handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  const userPasscode = body.passcode;

  const correctPasscode = process.env.CHAPTER_PASSCODE;

  if (!userPasscode) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "No passcode sent" })
    };
  }

  if (userPasscode === correctPasscode) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }

  return {
    statusCode: 403,
    body: JSON.stringify({ success: false })
  };
};

