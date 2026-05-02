import { DataSource, Repository } from 'typeorm';
import { Wifi } from './wifi.ts';

export class WifiRepository {
  private repo: Repository<Wifi>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Wifi);
  }

  create(wifiData: Partial<Wifi>): Wifi {
    return this.repo.create(wifiData);
  }

  update(bssid: string, updateData: Partial<Wifi>): Promise<void> {
    return this.repo.update({ bssid }, updateData).then(() => {});
  }

  findByBssid(bssid: string): Promise<Wifi | null> {
    return this.repo.findOne({ where: { bssid } });
  }

  findBySsid(ssid: string): Promise<Wifi | null> {
    return this.repo.findOne({ where: { ssid } });
  }

  findByDevice(related: string): Promise<Wifi | null> {
    return this.repo
      .createQueryBuilder('wifi')
      .where('wifi.relatedDevices LIKE :related', { related: `%${related}%` })
      .getOne();
  }

  findAll(): Promise<Wifi[]> {
    return this.repo.find();
  }

  save(wifi: Wifi): Promise<Wifi> {
    return this.repo.save(wifi);
  }

  remove(wifi: Wifi): Promise<Wifi> {
    return this.repo.remove(wifi);
  }
}