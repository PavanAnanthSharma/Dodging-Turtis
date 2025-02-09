import { GameContext } from '../../src/utils/web3';
import { useContext, useEffect } from 'react';
import NFT from '../NftCard';
import Footer from '../Footer';

const User = () => {
  const { state, setState } = useContext(GameContext);

  useEffect(() => {
    if (state.loaded) {
      loadNFT();
    }
  }, [state.loaded]);

  const loadNFT = async () => {
    const userNfts = [];
    try {
      const supply = await state.contract.methods
        .balanceOf(state.account)
        .call();
      console.log(supply);
      for (let i = 0; i < supply; i++) {
        const nft = parseInt(
          await state.contract.methods
            .tokenOfOwnerByIndex(state.account, i)
            .call()
        );
        const price = await state.contract.methods.turtlesForSale(nft).call();
        const url = await state.contract.methods.tokenURI(nft).call();
        userNfts.push({ url, price, page: 'main', tokenId: nft });
      }
    } catch (e) {
      console.log('nft fetch error');
    }
    userNfts.push({ url: 'dummy', price: 0, page: 'main', tokenId: -1 });
    setState({ ...state, userNfts });
  };

  const items =
    state.userNfts.length > 0 ? (
      state.userNfts.map((nft: INft) => <NFT key={nft.tokenId} nft={nft} />)
    ) : (
      <div className='container-fluid position-absolute top-50 start-50 translate-middle'></div>
    );

  return (
    <div className='container-fluid bg'>
      <div className='start' style={{ marginBottom: '5%' }}>
        <b>
          <h1>NFT&apos;s Connected to your wallet</h1>
        </b>
      </div>
      <div
        className='d-flex justify-content-center'
        style={{ flexWrap: 'wrap', marginBottom: '10%' }}>
        {items}
      </div>
      <Footer />
    </div>
  );
};

export default User;
