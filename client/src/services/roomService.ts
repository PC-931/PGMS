
import api from './api';
import {Room } from '../types';
class RoomService {
  private baseURL = 'admin/rooms'; // since api.ts already has /api

    async getAllRooms(): Promise<any> {
        const response = await api.get(this.baseURL);
        return response.data;
    }

    async getRoomById(id: string): Promise<Room> {
        const response = await api.get(`${this.baseURL}/${id}`);
        return response.data;
    }

    async createRoom(roomData: any): Promise<any> {
        const response = await api.post(this.baseURL, roomData);
        return response.data;
    } 

    async updateRoom(id: string, roomData: any): Promise<any> {
        const response = await api.put(`${this.baseURL}/${id}`, roomData);
        return response.data;
    }

    async deleteRoom(id: string): Promise<any> {
        const response = await api.delete(`${this.baseURL}/${id}`);
        return response.data;
    }
}

export const roomService = new RoomService();

