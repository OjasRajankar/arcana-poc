import { useCallback, useEffect, useState } from 'react';
import { AuthProvider, CHAIN } from '@arcana/auth'
import styled from 'styled-components'
import { ethers } from 'ethers'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: black;
  color: white;
`

const Button = styled.button`
  margin: 1rem;
  padding: 0.7rem;
  border: 2px solid white;
  font: white;
  border-radius: 15px;
  outline: none;
  cursor: pointer;
`

function App() {

  const appAddress = 'c22297c7d4B4046F2f110AC247E91f32B1809938'

  const auth = new AuthProvider(`${appAddress}`, {
    position: 'left',
    theme: 'light',
    alwaysVisible: true,
    chainConfig: {
      chainId: CHAIN.POLYGON_MAINNET,
      rpcUrl: '',
    },
  })

  let provider;
  const [authStatus, setAuthStatus] = useState(false)

  const init = useCallback(
    async () => {
      try {
        await auth.init()
        provider = auth.getProvider()
        console.log("init success")
        setAuthStatus(true)
        setHooks()
      } catch (e) {
        provider = window.ethereum
        console.log("error init: ", e)
      }
    },
    [auth],
  )


  const connectDiscord = async () => {
    try {
      const providerName = 'discord'
      await auth.loginWithSocial(providerName)
    } catch (err) {
      console.log(err)
    }
  }

  const checkConnected = async () => {
    try {
      const connected = await auth.isLoggedIn()
      console.log("connected to discord: ", connected)
      alert("connected: " + connected)
    } catch (err) {
      console.log(err)
    }
  }

  const disconnectDiscord = async () => {
    try {
      await auth.logout()
      console.log("disconnected discord")
      setAccount("")
    } catch (err) {
      console.log(err)
    }
  }

  const connectModal = async () => {
    try {
      await auth.connect();
      console.log("connecting auth")
    } catch (err) {
      console.log(err)
    }
  }

  const setHooks = () => {
    provider.on('connect', async (params) => {
      console.log({ type: 'connect', params: params })
      const isLoggedIn = await auth.isLoggedIn()
      console.log({ isLoggedIn })
      getAccount()
    })
    provider.on('accountsChanged', (params) => {
      //Handle
      console.log({ type: 'accountsChanged', params: params })
    })
    provider.on('chainChanged', async (params) => {
      console.log({ type: 'chainChanged', params: params })
    })
  }

  const changeNetworks = async () => {
    try {
      await auth.getProvider().request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xf00' }],
      });
    } catch (error) {
      console.log(error)
    }
  }

  const signTransaction = async () => {
    const { sig } = await auth.getProvider().request({
      method: 'eth_signTransaction',
      params: [
        {
          account, // sender account address
          gasPrice: 0,
          to: '0xE28F01Cf69f27Ee17e552bFDFB7ff301ca07e780', // receiver account address
          value: '0x0de0b6b3a7640000',
        },
      ],
    })
    console.log({ sig })
  }

  const [account, setAccount] = useState("")

  const getAccount = async () => {
    console.log('Requesting accounts')
    try {
      const accounts = await provider.request({ method: 'eth_accounts' })
      console.log({ accounts })
      setAccount(accounts[0])
    } catch (e) {
      console.log({ e })
    }
  }

  const [balance, setBalance] = useState("")

  const getBalance = async () => {
    {
      console.log('Requesting Balance')
      try {
        await auth.getProvider().request({ method: 'eth_getBalance' }).then((balance) => {
          // convert a currency unit from wei to ether
          const balanceInEth = ethers.utils.formatEther(balance)
          console.log(`balance: ${balanceInEth} ETH`)
          setBalance(balance)
        })
      } catch (e) {
        console.log({ e })
      }
    }
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <Wrapper className="App">
      {
        authStatus ?
          <>
            <Button onClick={connectModal} type={"button"} >Connect Modal</Button>
            <Button onClick={connectDiscord} type={"button"} >Connect Discord</Button>
            <Button onClick={checkConnected} type={"button"} >Check Connection</Button>
            {
              account !== "" ?
                <>
                  Connected To: {account}
                  <Button onClick={changeNetworks} type={"button"} >Change Network</Button>
                  <Button onClick={signTransaction} type={"button"} >Sign Transaction</Button>
                  <Button onClick={disconnectDiscord} type={"button"} >Disconnect Discord</Button>
                </> : "Not Connected Yet"}
          </> :
          <>
            Initializing Arcana Auth...
          </>
      }
    </Wrapper>
  );
}

export default App;
