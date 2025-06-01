const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Desplegando contrato con la cuenta:", deployer.address);

  const interestAmount = hre.ethers.parseEther("0.1"); // 0.1 DEV de interés
  const durationSeconds = 7 * 24 * 60 * 60; // 7 días en segundos

  const NativeLoanWithPenalty = await hre.ethers.getContractFactory("NativeLoanWithPenalty");
  const loan = await NativeLoanWithPenalty.deploy(interestAmount, durationSeconds, {
    value: hre.ethers.parseEther("1.0"), // 1 DEV como monto del préstamo
  });

  await loan.waitForDeployment();

  console.log("Contrato desplegado en:", await loan.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 