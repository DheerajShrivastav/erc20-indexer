import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { Alchemy, Network, Utils } from 'alchemy-sdk'
import { useState } from 'react'

function App() {
  const [userAddress, setUserAddress] = useState('')
  const [results, setResults] = useState([])
  const [hasQueried, setHasQueried] = useState(false)
  const [tokenDataObjects, setTokenDataObjects] = useState([])
  const [loading, setLoading] = useState(false)

  async function connetWallet() {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('please install MetaMask')
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })
      setUserAddress(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }
  async function getTokenBalance() {
    setLoading(true)
    const config = {
      apiKey: 'QfsaKZK96zCh4G9gO22K9sDnGNM5g2o-',
      network: Network.ETH_SEPOLIA,
    }

    const alchemy = new Alchemy(config)
    const data = await alchemy.core.getTokenBalances(userAddress)

    setResults(data)

    const tokenDataPromises = []

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      )
      tokenDataPromises.push(tokenData)
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises))
    setHasQueried(true)
    setLoading(false)
  }
  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
          placeholder= {userAddress}
        />
        <Text>or</Text>
        <Button fontsize={20} onClick={connetWallet} mt={36} bgColor={'blue'}>
          Connect Wallet
        </Button>

        <Button fontSize={20} onClick={getTokenBalance} mt={36} bgColor="blue">
          {loading ? <>Loding..</> : <>Check ERC-20 Token Balances</>}
        </Button>

        <Heading my={36}>ERC-20 token balances:</Heading>

        {hasQueried ? (
          <SimpleGrid columns={4} w={'fit-content'} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={'column'}
                  color="white"
                  bg="blue"
                  w={'fit-content'}
                  key={e.id}
                  padding={'20px'}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i].decimals
                    )}
                  </Box>
                  <Image src={tokenDataObjects[i].logo} />
                </Flex>
              )
            })}
          </SimpleGrid>
        ) : (
          'Please make a query! This may take a few seconds...'
        )}
      </Flex>
    </Box>
  )
}

export default App
