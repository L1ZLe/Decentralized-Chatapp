import User from "../modules/UserModel.js"
const auth = async (req, res, next) => {
  // Check if MetaMask or another Ethereum provider is installed
  if (typeof window.ethereum === "undefined") {
    return res.status(401).json({
      error:
        "Ethereum provider not detected. Please install MetaMask or use a compatible browser.",
    })
  }

  // Check if the user is logged in to MetaMask
  try {
    // Request access to the user's accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    // Check if any accounts are returned
    if (accounts.length === 0) {
      return res.status(401).json({
        error: "No Ethereum accounts connected. Please connect your wallet.",
      })
    }

    // Save the user's Ethereum address in request
    const address = accounts[0]
    req.user = await User.findOne({ address }).select("address")

    // Go to the next function/middleware
    next()
  } catch (error) {
    // User denied account access
    return res
      .status(401)
      .json({ error: "Access to Ethereum accounts denied by user." })
  }
}

export default auth
