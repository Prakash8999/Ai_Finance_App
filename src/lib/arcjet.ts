import arcjet, { tokenBucket } from 'arcjet';
if (!process.env.ARCJET_KEY) {
	throw new Error("ARCJET_KEY is not defined in environment variables.");
}

console.log("process.env.ARCJET_KEY ", process.env.ARCJET_KEY);
const aj = arcjet({
	key: process.env.ARCJET_KEY,
	characteristics: ['userId'],
	// log: true,
	rules: [

		tokenBucket({
			mode: "LIVE",
			refillRate: 100,
			interval: 3600,
			capacity: 100
		})
	]
})

export default aj;