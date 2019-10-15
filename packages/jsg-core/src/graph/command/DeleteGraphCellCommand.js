const AbstractItemCommand = require('./AbstractItemCommand');

/**
 * @class AddSheetNameCommand
 * @type {module.AddSheetNameCommand}
 */
module.exports = class DeleteGraphCellCommand extends AbstractItemCommand {
	static createFromObject(data = {}, { graph }) {
		const item = graph.getItemById(data.itemId);
		const name = item && item.getDataProvider().getGraph(data.sheetname);
		return name != null
			? new DeleteGraphCellCommand(item, name).initWithObject(data)
			: undefined;
	}

	constructor(item, name) {
		super(item);

		this._name = name;
	}

	initWithObject(data) {
		const cmd = super.initWithObject(data);
		return cmd;
	}

	toObject() {
		const data = super.toObject();
		data.sheetname = this._name.getName();
		return data;
	}

	undo() {
		const data = this._graphItem.getDataProvider();
		data.addGraph(this._name);
		this._graphItem.getGraph().markDirty();
	}

	redo() {
		const data = this._graphItem.getDataProvider();
		data.deleteGraph(this._name);
		this._graphItem.getGraph().markDirty();
	}

	doAfterRedo() {}

	doAfterUndo() {}
};
