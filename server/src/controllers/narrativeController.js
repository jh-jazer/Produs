import NarrativeQuestion from '../models/NarrativeQuestion.js';
import { ARCHETYPE_QUIZ } from '../shared/assessment.js';

// @desc    Get all narrative questions
// @route   GET /api/admin/narrative
// @access  Private/Admin
export const getAllQuestions = async (req, res) => {
    try {
        const questions = await NarrativeQuestion.find().sort({ questionId: 1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * validateIntegrity - Internal helper to ensure narrative nodes don't have broken links.
 * Checks for orphaned nextIds across the current payload AND existing database.
 * @param {Array} newNodes - The nodes being added/updated
 * @param {Boolean} isBulk - Whether this is a full replacement/bulk update
 */
const validateIntegrity = async (newNodes, isBulk = false) => {
    const errors = [];
    
    // 1. Get all IDs that WILL exist after this operation
    const existingIds = isBulk ? [] : (await NarrativeQuestion.find({}, 'questionId')).map(n => n.questionId);
    const newIds = newNodes.map(n => n.questionId);
    const allExpectedIds = [...new Set([...existingIds, ...newIds])];

    const idRegex = /^\d+\.\d+(\.\d+)*$/;

    newNodes.forEach(node => {
        // Format Check
        if (!idRegex.test(node.questionId)) {
            errors.push(`Node [${node.questionId}]: Invalid ID format. Must be decimal string (e.g. "1.0")`);
        }

        // Structural Check
        if (!node.options || node.options.length === 0) {
            errors.push(`Node [${node.questionId}]: Must have at least one choice option.`);
        }

        // Link Check
        node.options?.forEach((opt, idx) => {
            if (opt.nextId) {
                const cleanNextId = String(opt.nextId).trim();
                // Special case for self-loops or valid targets
                if (!allExpectedIds.includes(cleanNextId)) {
                    errors.push(`Node [${node.questionId}] -> Option ${idx + 1}: Points to missing ID [${cleanNextId}]`);
                }
            }
            if (!opt.text) errors.push(`Node [${node.questionId}] -> Option ${idx + 1}: Missing text.`);
            if (opt.value === undefined || opt.value === null) {
                errors.push(`Node [${node.questionId}] -> Option ${idx + 1}: Missing scoring value.`);
            }
        });
    });

    return errors;
};

// @desc    Create or update a narrative question
// @route   POST /api/admin/narrative
// @access  Private/Admin
export const upsertQuestion = async (req, res) => {
    try {
        const { questionId, originalId, title, section, type, weight, story, question, options } = req.body;

        // Integrity Check
        const errors = await validateIntegrity([req.body]);
        if (errors.length > 0) {
            return res.status(400).json({ message: 'Neural Integrity Failure', errors });
        }

        let targetId = questionId;

        // If renaming an existing question, update its ID and cascade rename all nextId links
        if (originalId && originalId !== questionId) {
            await NarrativeQuestion.findOneAndUpdate({ questionId: originalId }, { questionId });
            
            // Cascade update: Search all questions for any option that points to the old ID
            await NarrativeQuestion.updateMany(
                { "options.nextId": originalId },
                { $set: { "options.$[elem].nextId": questionId } },
                { arrayFilters: [{ "elem.nextId": originalId }] }
            );
            targetId = questionId;
        }

        const updatedQuestion = await NarrativeQuestion.findOneAndUpdate(
            { questionId: targetId },
            { title, section, type, weight, story, question, options },
            { new: true, upsert: true }
        );

        res.status(201).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a narrative question
// @route   DELETE /api/admin/narrative/:questionId
// @access  Private/Admin
export const deleteQuestion = async (req, res) => {
    try {
        const result = await NarrativeQuestion.findOneAndDelete({ questionId: req.params.questionId });
        if (!result) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Purge all narrative questions
// @route   DELETE /api/admin/narrative
// @access  Private/Admin
export const deleteAllQuestions = async (req, res) => {
    try {
        await NarrativeQuestion.deleteMany({});
        res.json({ message: 'All neural synapses purged.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk upsert narrative questions from JSON
// @route   POST /api/admin/narrative/bulk
// @access  Private/Admin
export const bulkUpsertQuestions = async (req, res) => {
    try {
        const questions = req.body;
        if (!Array.isArray(questions)) {
            return res.status(400).json({ message: 'Payload must be a JSON array of questions.' });
        }

        // Integrity Check
        const errors = await validateIntegrity(questions, true);
        if (errors.length > 0) {
            return res.status(400).json({ 
                message: 'Narrative Synthesis Failed: Orphaned Links or Structural Errors Detected.', 
                errors 
            });
        }

        const bulkOps = questions.map(q => ({
            updateOne: {
                filter: { questionId: q.questionId },
                update: { 
                    $set: {
                        title: q.title,
                        section: q.section,
                        type: q.type,
                        weight: q.weight,
                        story: q.story,
                        question: q.question,
                        options: q.options
                    }
                },
                upsert: true
            }
        }));

        const result = await NarrativeQuestion.bulkWrite(bulkOps);

        res.json({ 
            message: `Successfully processed ${questions.length} nodes.`,
            upsertedCount: result.upsertedCount,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Bulk import failed:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Seed narrative questions from static assessment.js
// @route   POST /api/admin/narrative/seed
// @access  Private/Admin
export const seedNarrative = async (req, res) => {
    try {
        const results = [];
        for (const q of ARCHETYPE_QUIZ) {
            const narrativeQ = {
                questionId: String(q.id),
                title: q.title || "Neural Synthesis",
                section: q.section,
                type: q.type || (q.weight >= 4.0 ? 'ACTION' : 'WHY'),
                weight: q.weight || 1.0,
                story: q.story || "",
                question: q.question,
                options: q.options.map(opt => ({
                    text: opt.text,
                    value: opt.value,
                    postText: opt.postText || "",
                    nextId: opt.nextId || null
                }))
            };

            const updated = await NarrativeQuestion.findOneAndUpdate(
                { questionId: narrativeQ.questionId },
                { $set: narrativeQ },
                { new: true, upsert: true }
            );
            results.push(updated);
        }

        res.json({ 
            message: `Neural synchronization complete. ${results.length} narrative nodes established.`, 
            count: results.length 
        });
    } catch (error) {
        console.error('Seed synchronization failed:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single question by ID for the quiz
// @route   GET /api/narrative/:questionId
// @access  Private
export const getQuestionById = async (req, res) => {
    try {
        const question = await NarrativeQuestion.findOne({ questionId: req.params.questionId });
        if (!question) {
            return res.status(404).json({ message: 'Neural synapse not found.' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
