/**
 * 日付操作のユーティリティ関数
 * 初心者向け：日付の操作を簡単にする関数群
 */

import { format, parseISO, startOfMonth, endOfMonth, isToday, isThisMonth } from 'date-fns';

/**
 * 日付を指定された形式でフォーマット
 * @param date - フォーマットする日付
 * @param formatString - フォーマット文字列
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (date: Date | string, formatString: string = 'yyyy-MM-dd'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return '';
  }
};

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 * @returns 今日の日付文字列
 */
export const getTodayString = (): string => {
  return formatDate(new Date(), 'yyyy-MM-dd');
};

/**
 * 指定された月の最初と最後の日を取得
 * @param date - 基準となる日付
 * @returns 月の開始日と終了日
 */
export const getMonthRange = (date: Date) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

/**
 * 日付が今日かどうかを判定
 * @param date - 判定する日付
 * @returns 今日の場合true
 */
export const isTodayDate = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isToday(dateObj);
  } catch (error) {
    console.error('日付判定エラー:', error);
    return false;
  }
};

/**
 * 日付が今月かどうかを判定
 * @param date - 判定する日付
 * @returns 今月の場合true
 */
export const isThisMonthDate = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isThisMonth(dateObj);
  } catch (error) {
    console.error('月判定エラー:', error);
    return false;
  }
};

/**
 * 時刻を12時間形式に変換
 * @param time - 24時間形式の時刻（HH:mm）
 * @returns 12時間形式の時刻
 */
export const formatTime12Hour = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('時刻フォーマットエラー:', error);
    return time;
  }
};
