import birdDefault from '../assets/images/birdup.png';
import birdDefaultFlap from '../assets/images/bird copy.png';
import birdBrown from '../assets/images/brown.png';
import birdBlue from '../assets/images/blue.png';
import birdYellow from '../assets/images/yellow.png';
import birdChampion from '../assets/images/Bird-2.png';

const skins = [
  {
    id: 'default',
    name: 'Classic Bird',
    image: birdDefault,
    flapImage: birdDefaultFlap,
    price: 0,
  },
  {
    id: 'red',
    name: 'Brown Browny',
    image: birdBrown,
    flapImage: birdBrown, // Using same image for now, can be updated later
    price: 30,
  },
  {
    id: 'blue',
    name: 'Blue Bolt',
    image: birdBlue,
    flapImage: birdBlue, // Using same image for now, can be updated later
    price: 40,
    filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))',

  },
  {
    id: 'golden',
    name: 'Golden Legend',
    image: birdYellow,
    flapImage: birdYellow, // Using same image for now, can be updated later
     price: 0,
    unlockType: 'highScore',
    unlockValue: 50,
    unlockDescription: 'Reach a high score of 50 or more in a single run.',
  },
  {
    id: 'challenge_champion',
    name: 'Challenge Champion',
    image: birdChampion,
    flapImage: birdChampion, // Using same image for now
    price: 0,
    unlockType: 'dailyChallenges',
    unlockDescription: 'Complete all daily challenges in a single day.',
    filter: 'hue-rotate(280deg) saturate(1.4) drop-shadow(0 0 14px rgba(249, 168, 212, 0.85))',
  }
];

export default skins;