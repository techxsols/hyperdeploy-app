Project Description
HyperDeploy is a tool to deploy the smart contract across multiple chains. Managing gas on multiple chains is a nightmare which requires lots of manual work and bridging. Smart contract developers also need to be wary of the security of the funder wallet, and the collaboration is limited.

HyperDeploy offers a better way. The developer only needs to have funds on a single chain, the bridging is done automatically in a single transaction. The developer also doesn't need to worry about gas fees and private key management, as those are covered and abstracted away. Finally, developers can easily collaborate and deploy from the same shared account which needs to be funded once.

How it's Made
Under the hood, HyperDeploy uses Hyperlane, Safe, and Pimlico.

Hyperlane abstracts away the cross-chain messaging. The BytecodeRouter contract calls the Mailbox for each specified target destination to send the message. The BytecodeReceiver handles the message on the receiving side to call the CreateX factory singleton and deploy the contract with the specified metadata.

Safe abstracts away wallet and account management. Used together with 4337 module, it allows to manage the access control via multisig while offering the gas free experience. We're using burner wallets as the account signers to further improve the UX and completely remove dealing with wallets as an issue.

Pimlico is used to manage bundling and paymastering. As an infrastructure layer, it handles the low-level transaction workflows and makes sure User Operations are executed properly.
