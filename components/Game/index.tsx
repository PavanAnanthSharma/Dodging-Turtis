import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { GameContext } from '../../src/utils/web3';
import { useGame } from './hooks';

const GameScreen = () => {
  const { state } = useContext(GameContext);
  const [ended, setEnded] = useState(false);
  const router = useRouter();
  const parentEl = useRef<HTMLDivElement>(null);
  const { game, grs } = useGame(parentEl);

  const endGameCB = useCallback(
    (score: number) => {
      const currHighScore = parseInt(state.highScore);
      if (score > parseFloat(localStorage.getItem('highScore') ?? '0'))
        localStorage.setItem('highScore', '' + score);
      if (score - currHighScore > 100) {
        // alert(
        //   `New high score of ${score}!!\n
        //   A mystery character is being created for you.\n
        //   Check in after a few minutes`
        // );
        // try {
        //   state.contract.methods.requestNewRandomTurtle(score.toString()).send({
        //     from: state.account,
        //     gasPrice: state.web3.utils.toWei('50', 'Gwei'),
        //     gas: 500000,
        //   });
        // } catch (e) {
        //   console.error('random turtle error');
        //   console.error(e);
        // }
      }
      setEnded(true);
    },
    [state]
  );

  useEffect(() => {
    // if (state.loaded) {
    if (game && !ended) {
      console.log('starting game');
      game.scene.start('boot', {
        grs,
        initGameData: {
          turtleUrl: state.selectedNFT.image,
          playerSpeed: state.selectedNFT.speed / 100,
          endGameCB,
        },
      });
    }
    if (ended) {
      console.log('rerouting');
      router.push('/home');
    }
    // }
  }, [game, state, ended, router]);

  return (
    <>
      <div ref={parentEl} style={{ height: '100vh', overflow: 'hidden' }} />
      <div id='font-hack'>.</div>
    </>
  );
};

export default GameScreen;
