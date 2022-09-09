import crel from 'crel'
import { getNodeById } from './main'
import PubSub from 'pubsub-js'

const area = document.getElementById('area')

// we use this when a line only has one connection
export let partialLine = null
// remember the output node when creating a connection
let output = null

// we need a invisible div for endpoint of the partialLine
const mouseFollower = crel('div', { id: 'mouse-follower' })
area.appendChild(mouseFollower)

const handleMouseMove = (e) => {
	if (!partialLine) return
	mouseFollower.style.top = e.clientY + 'px'
	mouseFollower.style.left = e.clientX + 'px'
	partialLine.position()
}
area.addEventListener('mousemove', handleMouseMove)

export const createConnection = (target) => {
	if (target.classList.contains('dot-connected')) {
		PubSub.publish('connection_remove', target.parentElement.parentElement.id)
		return false
	}
	if (!partialLine && target.classList.contains('dot-right')) {
		// create partialLine if there isn't one and the target is Output
		const pos = target.getBoundingClientRect()
		mouseFollower.style.top = `${pos.y}px`
		mouseFollower.style.left = `${pos.x - 5}px`

		partialLine = new LeaderLine(target, mouseFollower)
		output = target
		return false
	}
	if (partialLine && target.classList.contains('dot-left')) {
		const inputNode = getNodeById(target.parentElement.parentElement.id)

		const outputNode = getNodeById(output.parentElement.parentElement.id)

		// Create the actual line and give it an id
		const line = new LeaderLine(output, target)
		console.log(output.parentElement.parentElement.id)
		line.id = outputNode.element.id + inputNode.element.id

		target.classList.add('dot-connected')
		// clean the temp variables and remove the partialLine
		resetConnection()
		return {
			line,
			inputNode,
			outputNode,
		}
	}
}

PubSub.subscribe('connection_create', createConnection)

const resetConnection = () => {
	partialLine.remove()
	partialLine = null
	output = null
}
