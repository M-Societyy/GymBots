function esperar (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  esperar
}
