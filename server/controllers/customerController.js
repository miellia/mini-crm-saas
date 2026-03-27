const Customer = require('../models/Customer');
const Interaction = require('../models/Interaction');

/**
 * Retrieves a paginated, sorted, and filtered list of customers.
 * GET /api/customers
 * @param {Object} req - Express request object (includes query params for search, status, tag, sort)
 * @param {Object} res - Express response object
 */
exports.getCustomers = async (req, res) => {
  try {
    const { search, status, tag, sort } = req.query;
    let query = {};

    // Search by name, email, or company
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by tag
    if (tag && tag !== 'all') {
      query.tags = tag;
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'company') sortOption = { company: 1 };

    const customers = await Customer.find(query).sort(sortOption);

    res.json({ success: true, data: customers, count: customers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Aggregates analytical statistics for the dashboard, including pipeline metrics and recent growth.
 * GET /api/customers/stats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getStats = async (req, res) => {
  try {
    const total = await Customer.countDocuments();
    const leads = await Customer.countDocuments({ status: 'Lead' });
    const contacted = await Customer.countDocuments({ status: 'Contacted' });
    const qualified = await Customer.countDocuments({ status: 'Qualified' });
    const converted = await Customer.countDocuments({ status: 'Converted' });
    const lost = await Customer.countDocuments({ status: 'Lost' });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await Customer.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    const interactionsThisMonth = await Interaction.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    // Pipeline data for charts
    const pipelineData = [
      { name: 'Lead', value: leads },
      { name: 'Contacted', value: contacted },
      { name: 'Qualified', value: qualified },
      { name: 'Converted', value: converted },
      { name: 'Lost', value: lost },
    ];

    // Recent customers
    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly growth (last 6 months)
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const count = await Customer.countDocuments({
        createdAt: { $gte: start, $lt: end },
      });

      monthlyGrowth.push({
        month: start.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        customers: count,
      });
    }

    res.json({
      success: true,
      data: {
        total,
        leads,
        contacted,
        qualified,
        converted,
        lost,
        newThisMonth,
        interactionsThisMonth,
        pipelineData,
        recentCustomers,
        monthlyGrowth,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/customers/:id
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Creates a new customer profile.
 * POST /api/customers
 * @param {Object} req - Express request object (contains customer data in body)
 * @param {Object} res - Express response object
 */
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A customer with this email already exists',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/customers/:id
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Also delete related interactions
    await Interaction.deleteMany({ customer: req.params.id });

    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/customers/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Lead', 'Contacted', 'Qualified', 'Converted', 'Lost'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Logs a new interaction (note, meeting, call) for a specific customer.
 * POST /api/customers/:id/interactions
 * @param {Object} req - Express request object (params.id = customer ID)
 * @param {Object} res - Express response object
 */
exports.addInteraction = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const interaction = await Interaction.create({
      customer: req.params.id,
      type: req.body.type || 'note',
      content: req.body.content,
    });

    res.status(201).json({ success: true, data: interaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/customers/:id/interactions
exports.getInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.find({
      customer: req.params.id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: interactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
