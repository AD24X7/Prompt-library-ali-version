const express = require('express');
const { prisma } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const activityService = require('../services/activityService');

const router = express.Router();

// Mock data for when database is unavailable
const mockPrompts = [
  {
    id: '1',
    title: 'Email Marketing Campaign Brief',
    description: 'Create a comprehensive brief for an email marketing campaign',
    prompt: 'Write a detailed email marketing campaign brief that includes:...',
    category: 'Marketing',
    tags: ['email', 'marketing', 'campaign'],
    difficulty: 'medium',
    estimatedTime: '15-20 minutes',
    placeholders: ['[PRODUCT_NAME]', '[TARGET_AUDIENCE]', '[GOAL]'],
    rating: 4.5,
    usageCount: 234,
    authorId: 'user1',
    author: { id: 'user1', name: 'John Doe', avatar: null },
    reviews: [],
    reviewCount: 0,
    avgRating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Product Launch Strategy',
    description: 'Template for planning a product launch',
    prompt: 'Develop a comprehensive product launch strategy that covers...',
    category: 'Strategy',
    tags: ['launch', 'strategy', 'product'],
    difficulty: 'hard',
    estimatedTime: '20-30 minutes',
    placeholders: ['[PRODUCT_NAME]', '[MARKET]', '[BUDGET]'],
    rating: 4.8,
    usageCount: 156,
    authorId: 'user2',
    author: { id: 'user2', name: 'Jane Smith', avatar: null },
    reviews: [],
    reviewCount: 0,
    avgRating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all prompts
router.get('/', async (req, res) => {
  try {
    const { category, search, tags, limit = 50, offset = 0 } = req.query;
    
    let where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { prompt: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim());
      where.tags = { hasSome: tagList };
    }

    const prompts = await prisma.prompt.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        },
        reviews: {
          select: { id: true, rating: true, createdAt: true },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Calculate average rating for each prompt
    const enrichedPrompts = prompts.map(prompt => ({
      ...prompt,
      reviewCount: prompt._count.reviews,
      avgRating: prompt.reviews.length > 0 
        ? prompt.reviews.reduce((sum, r) => sum + r.rating, 0) / prompt.reviews.length
        : 0
    }));

    res.json({ data: enrichedPrompts });
  } catch (error) {
    console.error('Get prompts error:', error);
    // Return mock data if database is unavailable
    if (error.code === 'P1001' || error.message?.includes('database')) {
      console.warn('⚠️  Database unavailable, returning mock data');
      return res.json({ 
        data: mockPrompts.slice(0, parseInt(limit) || 50),
        warning: 'Using mock data - database connection failed'
      });
    }
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Get single prompt
router.get('/:id', async (req, res) => {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        categoryObj: true
      }
    });
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Log view activity
    try {
      await activityService.logPromptView(prompt.id, req.user?.id, req);
    } catch (err) {
      console.warn('Failed to log activity:', err.message);
    }

    // Calculate average rating
    const avgRating = prompt.reviews.length > 0 
      ? prompt.reviews.reduce((sum, r) => sum + r.rating, 0) / prompt.reviews.length
      : 0;

    res.json({ 
      data: {
        ...prompt,
        rating: avgRating
      }
    });
  } catch (error) {
    console.error('Get prompt error:', error);
    // Return mock data if database is unavailable
    if (error.code === 'P1001' || error.message?.includes('database')) {
      console.warn('⚠️  Database unavailable, returning mock data');
      const mockData = mockPrompts.find(p => p.id === req.params.id);
      if (mockData) {
        return res.json({ data: mockData, warning: 'Using mock data - database connection failed' });
      }
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

// Create new prompt (allow both auth and non-auth for development)
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      prompt, 
      category, 
      tags, 
      difficulty, 
      estimatedTime, 
      placeholders 
    } = req.body;
    
    if (!title || !prompt) {
      return res.status(400).json({ error: 'Title and prompt are required' });
    }

    const newPrompt = await prisma.prompt.create({
      data: {
        title,
        description: description || '',
        prompt,
        category: category || 'Uncategorized',
        tags: tags || [],
        difficulty: difficulty || 'medium',
        estimatedTime: estimatedTime || '5-10 minutes',
        placeholders: placeholders || [],
        authorId: req.user.id
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Log activity
    await activityService.logPromptCreate(newPrompt.id, req.user.id, req);
    
    res.status(201).json({ data: newPrompt });
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// Update prompt
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id: req.params.id }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Check if user owns the prompt
    if (prompt.authorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own prompts' });
    }
    
    const updatedPrompt = await prisma.prompt.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Log activity
    await activityService.logPromptEdit(updatedPrompt.id, req.user.id, req);
    
    res.json({ data: updatedPrompt });
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// Delete prompt
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id: req.params.id }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Check if user owns the prompt
    if (prompt.authorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own prompts' });
    }
    
    await prisma.prompt.delete({
      where: { id: req.params.id }
    });

    // Log activity
    await activityService.logPromptDelete(prompt.id, req.user.id, req);
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// Track usage
router.post('/:id/use', async (req, res) => {
  try {
    const prompt = await prisma.prompt.update({
      where: { id: req.params.id },
      data: {
        usageCount: { increment: 1 }
      }
    });

    // Log activity
    await activityService.logPromptTest(prompt.id, req.user?.id, req);
    
    res.json({ message: 'Usage tracked' });
  } catch (error) {
    console.error('Track usage error:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

// Add review/rating
router.post('/:id/review', authenticateToken, async (req, res) => {
  try {
    const { 
      rating, 
      comment, 
      toolUsed, 
      whatWorked, 
      whatDidntWork, 
      improvementSuggestions, 
      testRunGraphicsLink 
    } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const prompt = await prisma.prompt.findUnique({
      where: { id: req.params.id }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        toolUsed: toolUsed || null,
        whatWorked: whatWorked || null,
        whatDidntWork: whatDidntWork || null,
        improvementSuggestions: improvementSuggestions || null,
        testRunGraphicsLink: testRunGraphicsLink || null,
        promptId: req.params.id,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Update prompt's average rating
    const allReviews = await prisma.review.findMany({
      where: { promptId: req.params.id }
    });
    
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await prisma.prompt.update({
      where: { id: req.params.id },
      data: { rating: avgRating }
    });

    // Log activity
    await activityService.logReviewAdd(req.params.id, review.id, req.user.id, req);
    
    res.status(201).json({ data: review });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

module.exports = router;