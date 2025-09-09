// TODO: Implement CowSwap
//   - install appData package: npm install @cowprotocol/app-data
//   - orderBookApi.getQuote (add appData and appDataHash to OrderQuoteRequest)
//   - OrderSigningUtils.signOrder
//   - orderBookApi.sendOrder
//   - orderBookApi.waitForOrderExecution
//   - Cancel button: OrderSigningUtils.signOrderCancellations & orderBookApi.sendSignedOrderCancellations
//   - more info: https://learn.cow.fi/tutorial/getting-started-order
//   - example: https://github.com/cowprotocol/cow-sdk/blob/d30a63fbbe7df4cd6af5fc5771c7795e8a6bd92e/examples/react/viem/src/components/SwapForm/index.tsx#L50
// also add Partner fee
//   - https://docs.cow.fi/cow-protocol/reference/sdks/app-data/namespaces/v1_6_0#partnerfee
//   - { recipient: PartnerAccount ; volumeBps: VolumeBasisPointBPS }
//   - https://docs.cow.fi/governance/fees/partner-fee