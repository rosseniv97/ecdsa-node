const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");

const generator = (msg = "hash") => {
    const privateKey = toHex(keccak256(secp.utils.randomPrivateKey()))
    const publicKey = toHex(secp.getPublicKey(privateKey))
    //const [signature, recoveryBit] = secp.sign(hashedMsg, privateKey, {recovered: true})
    console.log("Private Key: " + privateKey)
    console.log("Public Key: " + publicKey)
}

generator()