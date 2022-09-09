import crel from 'crel'
import PubSub from 'pubsub-js'
import { createConnection } from './connection'
import { toggleMenu, createLeftClickMenu, createNodeMenu } from './menus'
const area = document.getElementById('area')

let nodes = []
const connections = {}

// Utility functions
export const getNodeById = (id) => {
	return nodes.find((node) => node.element.id === id)
}

// TODO: Why is this called twice?
const removeNode = (msg, id) => {
	const node = getNodeById(id)
	if (!node) return
	for (const [key, value] of Object.entries(connections)) {
		console.log(value.inputNode.element.id)
		console.log(value.outputNode.element.id)
		if (value.inputNode.element.id === id || value.outputNode.element.id === id)
			PubSub.publish('connection_remove', value.inputNode.element.id)
	}
	node.element.remove()
	nodes = nodes.filter((node) => {
		return node.element.id !== id
	})

	console.log(nodes.length)
}

PubSub.subscribe('node_remove', removeNode)

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

		// remove connection, unsub line, input and this remover
		connection.remover = (msg, data) => {
			if (data !== connection.inputNode.element.id) return
			connection.inputNode.element
				.querySelector('.dot-left')
				.classList.remove('dot-connected')
			connection.line.remove()
			PubSub.unsubscribe(connection.lineToken)
			PubSub.unsubscribe(connection.nodeToken)
			PubSub.unsubscribe(connection.removeToken)
			delete connections[data]
		}

		connection.removeToken = PubSub.subscribe(
			'connection_remove',
			connection.remover
		)

		// Add to connections
		connections[connection.line.id] = connection
	}
}

// menus
const nodeMenu = createNodeMenu()
const contextMenu = createLeftClickMenu(nodes, tryConnection)
area.appendChild(nodeMenu)
area.appendChild(contextMenu)

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
