import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../services/storageservice';
import { Event, CreateEventDTO, UpdateEventDTO } from '../models/event';

const EVENTS_FILE = 'events.json';

export const eventController = {
  /**
   * GET /api/events
   * Get all events
   */
  getAll(_req: Request, res: Response): void {
    try {
      const events = storageService.read<Event>(EVENTS_FILE);
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch events', error });
    }
  },

  /**
   * GET /api/events/:id
   * Get a single event by ID
   */
  getById(req: Request, res: Response): void {
    try {
      const { id } = req.params as { id: string };
      const event = storageService.findById<Event>(EVENTS_FILE, id);
      
      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }
      
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch event', error });
    }
  },

  /**
   * POST /api/events
   * Create a new event
   */
  create(req: Request, res: Response): void {
    try {
      const body: CreateEventDTO = req.body;
      
      // Validation
      if (!body.title || !body.startDate || !body.endDate) {
        res.status(400).json({ message: 'title, startDate, and endDate are required' });
        return;
      }
      
      const now = new Date().toISOString();
      const newEvent: Event = {
        id: uuidv4(),
        title: body.title,
        description: body.description || '',
        startDate: body.startDate,
        endDate: body.endDate,
        allDay: body.allDay || false,
        color: body.color || '#3788d8',
        createdAt: now,
        updatedAt: now
      };
      
      const created = storageService.create<Event>(EVENTS_FILE, newEvent);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create event', error });
    }
  },

  /**
   * PUT /api/events/:id
   * Update an existing event
   */
  /**
   * PUT /api/events/:id
   * Update an existing event
   */
  update(req: Request, res: Response): void {
    try {
      const { id } = req.params as { id: string };
      const body: UpdateEventDTO = req.body;
      
      const existing = storageService.findById<Event>(EVENTS_FILE, id);
      if (!existing) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }
      
      const updates: Partial<Event> = {
        ...body,
        updatedAt: new Date().toISOString()
      };
      
      const updated = storageService.update<Event>(EVENTS_FILE, id, updates);
      if (!updated) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update event', error });
    }
  },

  /**
   * DELETE /api/events/:id
   * Delete an event
   */
  delete(req: Request, res: Response): void {
    try {
      const { id } = req.params as { id: string };
      
      const deleted = storageService.delete<Event>(EVENTS_FILE, id);
      
      if (!deleted) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }
      
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete event', error });
    }
  }
};