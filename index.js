import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw


async function connect() {
    //check for crypto wallet
    if (typeof window.ethereum !== "undefined") {
      try {
        await ethereum.request({ method: "eth_requestAccounts" })
      } catch (error) {
        console.log(error)
      }
      connectButton.innerHTML = "Connected"
      const accounts = await ethereum.request({ method: "eth_accounts" })
    } else {
      connectButton.innerHTML = "Please install MetaMask"
    }
  }

async function getBalance() {
  if (typeof window.ethereum != "undefined"){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}


async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with: ${ethAmount}...`)

    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        //connecting signer to contract
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
          const transactionResponse = await contract.fund({value: ethers.utils.parseEther(ethAmount),})
          await listenForTransactionMine(transactionResponse, provider)
          console.log("Done!")
        } catch (error) {
          console.log(error)
        }
    } else {
      connectButton.innerHTML = "Please install MetaMask"
    }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)

  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(`Completed with ${transactionReceipt.confirmations} confirmations`)
      resolve()
    })
  })
  
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing funds...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
      console.log("Funds Withdrawn!")
    } catch (error) {
      console.log(error)
    }
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}