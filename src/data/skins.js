import birdDefault from '../assets/images/birdup.png';
import birdDefaultFlap from '../assets/images/bird copy.png';
import birdBrown from '../assets/images/brown.png';
import birdBlue from '../assets/images/blue.png';
import birdYellow from '../assets/images/yellow.png';

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
  },
  {
    id: 'golden',
    name: 'Golden Legend',
    image: birdYellow,
    flapImage: birdYellow, // Using same image for now, can be updated later
    price: 70,
  }
];

export default skins;