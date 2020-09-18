export default function responseWithErrorMessage(res, message) {
  return res.json({
    message: {
      type: 'error',
      title: 'Error',
      body: message
    }
  })
}
