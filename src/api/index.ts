/**
 * Fetches WakaTime all-time data
 * Returns fallback data if API fails (403, 401, or other errors)
 */
export const getWakaTimeData = async () => {
  try {
    const token: string = Buffer.from(
      `${process.env.WAKATIME_API_KEY}`,
    ).toString('base64');

    const wakaTimeResponse = await fetch(
      `${process.env.WAKATIME_API}/users/current/all_time_since_today`,
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      },
    );

    // Check if response is successful
    if (!wakaTimeResponse.ok) {
      console.error(
        `WakaTime API error: ${wakaTimeResponse.status} ${wakaTimeResponse.statusText}`,
      );
      return getFallbackWakaTimeData();
    }

    const data = await wakaTimeResponse.json();
    return data;
  } catch (error) {
    console.error('Error fetching WakaTime data:', error);
    return getFallbackWakaTimeData();
  }
};

/**
 * Fetches WakaTime weekly stats including rankings
 * Returns fallback data if API fails (403, 401, or other errors)
 */
export const getWakaTimeWeek = async () => {
  try {
    const token: string = Buffer.from(
      `${process.env.WAKATIME_API_KEY}`,
    ).toString('base64');

    const [leadersRes, leadersRegRes, statsRes] = await Promise.all([
      fetch(`${process.env.WAKATIME_API}/leaders`, {
        headers: {
          Authorization: `Basic ${token}`,
        },
      }),
      fetch(`${process.env.WAKATIME_API}/leaders?country_code=ID`, {
        headers: {
          Authorization: `Basic ${token}`,
        },
      }),
      fetch(
        `${process.env.WAKATIME_API}/users/current/stats?including_today=true`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        },
      ),
    ]);

    // Check if all responses are successful
    if (!leadersRes.ok || !leadersRegRes.ok || !statsRes.ok) {
      const errors = [
        !leadersRes.ok &&
          `Leaders: ${leadersRes.status} ${leadersRes.statusText}`,
        !leadersRegRes.ok &&
          `Regional Leaders: ${leadersRegRes.status} ${leadersRegRes.statusText}`,
        !statsRes.ok && `Stats: ${statsRes.status} ${statsRes.statusText}`,
      ].filter(Boolean);

      console.error('WakaTime API errors:', errors.join(', '));
      return getFallbackWakaTimeWeek();
    }

    const [leadersData, leadersRegData, stats] = await Promise.all([
      leadersRes.json(),
      leadersRegRes.json(),
      statsRes.json(),
    ]);

    const data = {
      worldRank: leadersData.current_user?.rank ?? null,
      countryRank: leadersRegData.current_user?.rank ?? null,
      totalSeconds: stats.data?.total_seconds_including_other_language ?? 0,
      dailyAverage: stats.data?.daily_average_including_other_language ?? 0,
      languages:
        stats.data?.languages?.map((lang: Record<string, string>) => ({
          name: lang.name,
          total: lang.text,
        })) ?? [],
    };

    return data;
  } catch (error) {
    console.error('Error fetching WakaTime week data:', error);
    return getFallbackWakaTimeWeek();
  }
};

/**
 * Fallback data for WakaTime all-time stats
 */
function getFallbackWakaTimeData() {
  const today = new Date().toISOString();
  return {
    data: {
      text: 'Data unavailable',
      total_seconds: 0,
      decimal: '0.00',
      digital: '0:00',
      is_up_to_date: true,
      percent_calculated: 100,
      range: {
        start: today,
        start_date: today.split('T')[0],
        start_text: 'Today',
        end: today,
        end_date: today.split('T')[0],
        end_text: 'Today',
        timezone: 'UTC',
      },
      timeout: 0,
    },
  };
}

/**
 * Fallback data for WakaTime weekly stats
 */
function getFallbackWakaTimeWeek() {
  return {
    worldRank: null,
    countryRank: null,
    totalSeconds: 0,
    dailyAverage: 0,
    languages: [],
  };
}
