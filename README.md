# Hyperdeploy App

> [!NOTE]  
> For the smart contracts, check out [HyperDeploy Contracts](https://github.com/Destiner/hyperdeploy-contracts).

<img width="792" alt="Screenshot 2024-03-17 at 07 24 14 copy" src="https://github.com/Destiner/hyperdeploy-app/assets/4247901/eb511886-d78c-4dec-89f8-486c7c68b9e9">


## Development

```sh
bun i
bun run dev
```

## Design

Note that the main goal of this application is to be as user friendly as possible without compromising much of the security. The application also strives to be as decentralized as possible, with the possibility for users to run their own instance and not rely on any backends.

The application uses Hyperdeploy smart contracts, as well as the Safe Wallet contracts and Pimlico infrastructure.

Hyperdeploy contracts handle the cross-chain messaging.

Safe Wallet is used together with the 4337 module to provide a gasless experience. Deployments are executed through Safe wallets. The application generates burner wallets as a Safe signers to abstract away any wallet management.

Pimlico is used to provide gas sponsorip and transaction settlement.

## Burner Keys and Collaboration

Burner keys are used as Safe Account signers. To simplify the UX, burner wallets are generated based on the user friendly phrase.

Interestingly, this opens up a possibility to collaborate with other users. The users can share the passphrases, as the same passphrase will generate the same burner wallets, and therefore the same Safe Wallet underneath.

Sharing a phrase is not ideal, as it creates some attack vectors. We would need to implement a proper access control by leveraging the Safe Wallet ownership and threshold system.
