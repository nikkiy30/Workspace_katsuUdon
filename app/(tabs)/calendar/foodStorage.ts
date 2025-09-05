import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem } from './foodTypes';

const FOOD_ITEMS_KEY = 'food_items';

export const getFoodItems = async (): Promise<FoodItem[]> => {
  try {
    const items = await AsyncStorage.getItem(FOOD_ITEMS_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error('Error getting food items:', error);
    return [];
  }
};

export const saveFoodItem = async (item: FoodItem): Promise<void> => {
  try {
    const existingItems = await getFoodItems();
    const updatedItems = [...existingItems, item];
    await AsyncStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error saving food item:', error);
  }
};

export const clearFoodItems = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FOOD_ITEMS_KEY);
  } catch (error) {
    console.error('Error clearing food items:', error);
  }
};

export const updateFoodItem = async (
  id: string,
  updates: Partial<FoodItem>
): Promise<void> => {
  try {
    const existingItems = await getFoodItems();
    const updatedItems = existingItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    await AsyncStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error updating food item:', error);
  }
};

export const deleteFoodItem = async (id: string): Promise<void> => {
  try {
    const existingItems = await getFoodItems();
    const filteredItems = existingItems.filter((item) => item.id !== id);
    await AsyncStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(filteredItems));
  } catch (error) {
    console.error('Error deleting food item:', error);
  }
};

