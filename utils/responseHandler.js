const RESPONSE_OK = 1;
const RESPONSE_ERROR = 0;
const RESPONSE_INTERNAL_SERVER_ERROR = -1;


exports.positiveResponse = (res, data, message="") => {
  res.json({
    status: true,
    message,
    data,
    responseCode: RESPONSE_OK,
  })
}

exports.negativeResponse = (res, error, message="") => {
  res.json({
    status: false,
    message,
    data: typeof error == 'string' ? error : (error.message || ""),
    responseCode: typeof error == 'string' ? RESPONSE_ERROR : RESPONSE_INTERNAL_SERVER_ERROR,
  })
}