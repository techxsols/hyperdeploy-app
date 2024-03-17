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
