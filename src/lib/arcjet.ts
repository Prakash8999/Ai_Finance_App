import arcjet, {tokenBucket} from 'arcjet';
const ARCJET_KEY = process.env.ARCJET_KEY as string; // Type assertion

const aj = arcjet({
	key: ARCJET_KEY,
	characteristics:['userId'],
rules:[
	tokenBucket({
		mode:"LIVE",
		refillRate:10,
		interval:3600,
		capacity:10
	})
]
})

export default aj;