import { Request, Response, NextFunction } from 'express';
import tributeService from '../services/tributeService';
import {
  createTributeSchema,
  updateTributeSchema,
  getTributesSchema,
  moderateTributeSchema
} from '../validation/tribute';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/auth';

export const createTribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { memorialPageId } = req.params;
    const { error, value } = createTributeSchema.validate(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const tribute = await tributeService.createTribute({
      memorialPageId,
      ...value
    });

    res.status(201).json({
      success: true,
      data: tribute
    });
  } catch (error) {
    next(error);
  }
};

export const getTributes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { memorialPageId } = req.params;
    const { error, value } = getTributesSchema.validate(req.query);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    // Get user ID from auth if available
    const userId = (req as AuthenticatedRequest).user?.id;

    const result = await tributeService.getTributesByMemorialPage(
      memorialPageId,
      value,
      userId
    );

    res.json({
      success: true,
      data: result.tributes,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getTributeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const tribute = await tributeService.getTributeById(id);

    res.json({
      success: true,
      data: tribute
    });
  } catch (error) {
    next(error);
  }
};

export const updateTribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error, value } = updateTributeSchema.validate(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const tribute = await tributeService.updateTribute(id, value);

    res.json({
      success: true,
      data: tribute
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await tributeService.deleteTribute(id);

    res.json({
      success: true,
      message: 'Tribute deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const moderateTribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error, value } = moderateTributeSchema.validate(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const tribute = await tributeService.moderateTribute(
      id,
      value.isApproved,
      value.reason
    );

    res.json({
      success: true,
      data: tribute
    });
  } catch (error) {
    next(error);
  }
};

export const getTributesForModeration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = getTributesSchema.validate(req.query);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const result = await tributeService.getTributesForModeration(value);

    res.json({
      success: true,
      data: result.tributes,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};