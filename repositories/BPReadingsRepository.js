import BaseRepository from './BaseRepository';

class BPReadingsRepository extends BaseRepository {
  constructor() {
    super('bp_readings', '/bp/readings');
  }

  // Create new BP reading
  async createReading(userId, readingData) {
    try {
      const requiredFields = ['systolic', 'diastolic'];
      for (const field of requiredFields) {
        if (!readingData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate BP values
      if (readingData.systolic < 70 || readingData.systolic > 250) {
        throw new Error('Systolic pressure must be between 70-250');
      }
      if (readingData.diastolic < 40 || readingData.diastolic > 150) {
        throw new Error('Diastolic pressure must be between 40-150');
      }
      if (readingData.pulse && (readingData.pulse < 30 || readingData.pulse > 220)) {
        throw new Error('Pulse must be between 30-220');
      }

      const data = {
        ...readingData,
        user_id: userId,
        reading_time: readingData.reading_time || new Date().toISOString(),
        interpretation: readingData.interpretation || this.interpretBP(readingData.systolic, readingData.diastolic)
      };

      return await this.create(data, userId);
    } catch (error) {
      console.error('[BPReadingsRepository] CreateReading failed:', error);
      throw error;
    }
  }

  // Get readings for user
  async getReadingsForUser(userId, limit = 100, orderBy = 'reading_time DESC') {
    try {
      return await this.findAll({ user_id: userId }, orderBy, limit);
    } catch (error) {
      console.error('[BPReadingsRepository] GetReadingsForUser failed:', error);
      throw error;
    }
  }

  // Get recent readings (last 30 days)
  async getRecentReadings(userId, days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const allReadings = await this.getReadingsForUser(userId);
      return allReadings.filter(reading => 
        new Date(reading.reading_time) >= cutoffDate
      );
    } catch (error) {
      console.error('[BPReadingsRepository] GetRecentReadings failed:', error);
      throw error;
    }
  }

  // Get readings by date range
  async getReadingsByDateRange(userId, startDate, endDate) {
    try {
      const allReadings = await this.getReadingsForUser(userId);
      return allReadings.filter(reading => {
        const readingDate = new Date(reading.reading_time);
        return readingDate >= new Date(startDate) && readingDate <= new Date(endDate);
      });
    } catch (error) {
      console.error('[BPReadingsRepository] GetReadingsByDateRange failed:', error);
      throw error;
    }
  }

  // Get average readings for a period
  async getAverageReadings(userId, days = 7) {
    try {
      const readings = await this.getRecentReadings(userId, days);
      
      if (readings.length === 0) {
        return null;
      }

      const totals = readings.reduce((acc, reading) => ({
        systolic: acc.systolic + reading.systolic,
        diastolic: acc.diastolic + reading.diastolic,
        pulse: acc.pulse + (reading.pulse || 0),
        count: acc.count + 1,
        pulseCount: acc.pulseCount + (reading.pulse ? 1 : 0)
      }), { systolic: 0, diastolic: 0, pulse: 0, count: 0, pulseCount: 0 });

      return {
        systolic: Math.round(totals.systolic / totals.count),
        diastolic: Math.round(totals.diastolic / totals.count),
        pulse: totals.pulseCount > 0 ? Math.round(totals.pulse / totals.pulseCount) : null,
        readingCount: totals.count,
        period: days
      };
    } catch (error) {
      console.error('[BPReadingsRepository] GetAverageReadings failed:', error);
      throw error;
    }
  }

  // Get latest reading
  async getLatestReading(userId) {
    try {
      const readings = await this.getReadingsForUser(userId, 1);
      return readings.length > 0 ? readings[0] : null;
    } catch (error) {
      console.error('[BPReadingsRepository] GetLatestReading failed:', error);
      throw error;
    }
  }

  // Save OCR reading
  async saveOCRReading(userId, ocrData) {
    try {
      const readingData = {
        systolic: ocrData.systolic,
        diastolic: ocrData.diastolic,
        pulse: ocrData.pulse,
        notes: ocrData.notes || 'Reading from OCR',
        device_id: ocrData.device_id || 'OCR_DEVICE',
        interpretation: ocrData.interpretation
      };

      return await this.createReading(userId, readingData);
    } catch (error) {
      console.error('[BPReadingsRepository] SaveOCRReading failed:', error);
      throw error;
    }
  }

  // Interpret BP reading
  interpretBP(systolic, diastolic) {
    if (systolic > 180 || diastolic > 120) {
      return 'Hypertensive Crisis - Seek immediate medical attention';
    } else if (systolic >= 140 || diastolic >= 90) {
      return 'Stage 2 Hypertension - Consult your doctor';
    } else if (systolic >= 130 || diastolic >= 80) {
      return 'Stage 1 Hypertension - Monitor closely';
    } else if (systolic >= 120 && diastolic < 80) {
      return 'Elevated - Take preventive measures';
    } else {
      return 'Normal blood pressure - Keep up the good work!';
    }
  }

  // Get BP category
  getBPCategory(systolic, diastolic) {
    if (systolic > 180 || diastolic > 120) {
      return 'Hypertensive Crisis';
    } else if (systolic >= 140 || diastolic >= 90) {
      return 'Stage 2 Hypertension';
    } else if (systolic >= 130 || diastolic >= 80) {
      return 'Stage 1 Hypertension';
    } else if (systolic >= 120 && diastolic < 80) {
      return 'Elevated';
    } else {
      return 'Normal';
    }
  }

  // Get readings statistics
  async getReadingsStats(userId, days = 30) {
    try {
      const readings = await this.getRecentReadings(userId, days);
      
      if (readings.length === 0) {
        return {
          totalReadings: 0,
          averages: null,
          categories: {},
          trend: null
        };
      }

      // Calculate averages
      const averages = await this.getAverageReadings(userId, days);

      // Count by categories
      const categories = readings.reduce((acc, reading) => {
        const category = this.getBPCategory(reading.systolic, reading.diastolic);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Calculate trend (compare first half vs second half)
      const midPoint = Math.floor(readings.length / 2);
      const firstHalf = readings.slice(midPoint);
      const secondHalf = readings.slice(0, midPoint);
      
      let trend = null;
      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((sum, r) => sum + r.systolic, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, r) => sum + r.systolic, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 5) {
          trend = 'increasing';
        } else if (secondAvg < firstAvg - 5) {
          trend = 'decreasing';
        } else {
          trend = 'stable';
        }
      }

      return {
        totalReadings: readings.length,
        averages,
        categories,
        trend,
        period: days
      };
    } catch (error) {
      console.error('[BPReadingsRepository] GetReadingsStats failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
const bpReadingsRepository = new BPReadingsRepository();
export default bpReadingsRepository;
