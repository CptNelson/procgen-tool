import crel from 'crel'
import PubSub from 'pubsub-js'
import { toggleMenu, createLeftClickMenu, createNodeMenu } from './menus'
import { createConnection } from './connection'

const area = document.getElementById('area')

const nodes = []
const lines = []
const connections = {}

// menus
const nodeMenu = createNodeMenu()
const contextMenu = createLeftClickMenu(nodes)
area.appendChild(nodeMenu)
area.appendChild(contextMenu)

// Utility functions
export const getNodeById = (id) => {
	console.log(nodes)
	return nodes.find((node) => node.element.id === id)
}

export const getLineById = (id) => {
	return lines.find((line) => line.id === id)
}

// connection functions
const tryConnection = (target) => {
	const connection = createConnection(target)
	if (connection) {
		// sub input to output's events
		connection.nodeToken = connection.inputNode.subscribe(
			connection.outputNode.topic
		)

		// Make the line follow nodes
		connection.inputNode.draggable.onMove = () => {
			PubSub.publish('moving', 'this')
		}
		connection.outputNode.draggable.onMove = () => {
			PubSub.publish('moving', 'this')
		}
		connection.move = (msg, data) => {
			if (connections[connection.line.id]) connection.line.position()
		}
		connection.lineToken = PubSub.subscribe('moving', connection.move)

		// remove connection, unsub line and input
		connection.remover = (msg, data) => {
			if (data !== connection.inputNode.element.id) return
			connection.line.remove()
			PubSub.unsubscribe(connection.lineToken)
			PubSub.unsubscribe(connection.nodeToken)
			delete connections[data]
		}
		PubSub.subscribe('remove_connection', connection.remover)

		// Add to connections
		connections[connection.line.id] = connection
	}
}

// event listeners for Crel elements
crel.attrMap['on'] = (element, value) => {
	for (let eventName in value) {
		element.addEventListener(eventName, value[eventName])
	}
}

document.addEventListener(
	'mouseup',
	(e) => {
		e.stopImmediatePropagation()
		if (e.shiftKey && e.target.parentElement.classList.contains('node'))
			toggleMenu(e, nodeMenu)
		if (!contextMenu.hidden) return (contextMenu.hidden = true)
		if (e.target.classList.contains('dot')) return tryConnection(e.target)
		if (e.target.id === 'area') toggleMenu(e, contextMenu)
	},
	{ passive: false }
)
