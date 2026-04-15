import { DataSource, Repository } from 'typeorm';
import { ShopProfile } from './shopProfile.ts';

export class ShopProfileRepository {
  private repo: Repository<ShopProfile>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(ShopProfile);
  }

  async getDefault(): Promise<ShopProfile> {
    let profile = await this.repo.findOne({ where: {} });
    if (!profile) {
      profile = this.repo.create({
        name: 'Laundry Coin Sumur Batu',
        tagline: 'SYSTEM MONITORING MESIN LAUNDRY',
      });
      await this.repo.save(profile);
    }
    return profile;
  }
  
}