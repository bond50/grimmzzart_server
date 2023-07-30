const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// Create wallet
exports.createWallet = async (req, res) => {
  try {
    const wallet = new Wallet(req.body);
    await wallet.save();
    res.status(201).json({ wallet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get wallet by ID
exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) {
      res.status(404).json({ error: 'Wallet not found' });
    } else {
      res.json({ wallet });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update wallet by ID
exports.updateWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!wallet) {
      res.status(404).json({ error: 'Wallet not found' });
    } else {
      res.json({ wallet });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete wallet by ID
exports.deleteWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findByIdAndDelete(req.params.id);
    if (!wallet) {
      res.status(404).json({ error: 'Wallet not found' });
    } else {
      res.json({ message: 'Wallet deleted successfully' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Transfer amount between two wallets
exports.transfer = async (req, res) => {
  const { fromWalletId, toWalletId, amount } = req.body;

  try {
    const fromWallet = await Wallet.findById(fromWalletId);
    const toWallet = await Wallet.findById(toWalletId);

    if (!fromWallet || !toWallet) {
      res.status(404).json({ error: 'One or both wallets not found' });
    } else if (fromWallet.balance < amount) {
      res.status(400).json({ error: 'Insufficient balance in the source wallet' });
    } else {
      fromWallet.balance -= amount;
      toWallet.balance += amount;

      const transaction = new Transaction({
        wallet: fromWallet._id,
        type: 'transfer',
        amount,
        currency: fromWallet.currency,
        description: `Transfer to wallet ${toWallet._id}`,
        from: fromWallet._id,
        to: toWallet._id,
      });

      await transaction.save();
      await fromWallet.save();
      await toWallet.save();

      res.json({ transaction });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
