
# IRIS Distributed Network

```text
               IRIS S2S hajautettuverkko
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      ┌────────┐     ┌────────┐     ┌────────┐
      │ iris-01│◄───►│ iris-02│◄───►│ iris-03│    + tai enemmän
      │  IRCd  │     │  IRCd  │     │  IRCd  │
      └───┬────┘     └───┬────┘     └───┬────┘
          │              │              │
       clients        clients        clients
          │              │              │
          └──────────────┼──────────────┘
                         │
                  distributed state
                         │
             ┌───────────┴───────────┐
             │                       │
        client state           channel state
             │                       │
        nick / user             members / servers


```

## Uuden palvelimen liittyminen hajautettuun verkkoon

```text
                         IRIS NETWORK
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
         ┌────────┐      ┌────────┐      ┌────────┐
         │ iris-01│◄────►│ iris-02│◄────►│ iris-03│
         └────────┘      └────────┘      └────────┘
                              ▲
                              │
                         IRIS S2S
                              │
                              │
                         ┌────┴────┐
                         │ iris-04 │
                         │  IRCd   │
                         └────┬────┘


```