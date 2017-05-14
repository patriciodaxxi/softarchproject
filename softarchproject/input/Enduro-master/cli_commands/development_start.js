module.exports = {
	command: 'dev',
	aliases: ['*'],
	desc: 'starts development server',
	builder: {
		'norefresh': {
			alias: 'r',
			describe: 'won\'t open browser on enduro start-up',
		},
		'nojuice': {
			alias: 'j',
			describe: 'turns juicebox off',
		},
		'nowatch': {
			alias: 'w',
			describe: 'will not watch for file changes',
		}
	},
	handler: function (cli_arguments) {
		var enduro_instance = require('../index')

		enduro_instance.init()
			.then(() => {
				enduro.flags = cli_arguments
				enduro.actions.developer_start()
			})
	}
}
