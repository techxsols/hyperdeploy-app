# Hyperdeploy App

> [!NOTE]  
> For the smart contracts, check out [HyperDeploy Contracts](https://github.com/Destiner/hyperdeploy-contracts).

## Development

```sh
bun i
bun run dev
```

## Design

The application uses Hyperdeploy smart contracts, as well as the Safe Wallet contracts and Pimlico infrastructure.

Hyperdeploy contracts handle the cross-chain messaging.

Safe Wallet is used together with the 4337 module to provide a gasless experience. Deployments are executed through Safe wallets. The application generates burner wallets as a Safe signers to abstract away any wallet management.

Pimlico is used to provide gas sponsorip and transaction settlement.

## Burner Keys and Collaboration

Burner keys are used as Safe Account signers. To simplify the UX, burner wallets are generated based on the user friendly phrase.

Interestingly, this opens up a possibility to collaborate with other users. The users can share the passphrases, as the same passphrase will generate the same burner wallets, and therefore the same Safe Wallet underneath.

Sharing a phrase is not ideal, as it creates some attack vectors. We would need to implement a proper access control by leveraging the Safe Wallet ownership and threshold system.
