export const feedbacks = (req, res) => {
  const db = req.app.locals.db;

  let feedbacks = db.get('feedbacks').filter(feedback => {
    let is = true
    for (const [key, value] of Object.entries(req.query)) {
      if (!feedback[key]) continue
      is = feedback[key] == value
    }
    return is
  }).value();

  for (const feedback of feedbacks) {
    const user = db.get('users').find({ id: feedback.userId }).value();

    feedback.user = {
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic,
      age: user.age
    }
  }

  const totalCount = feedbacks.length;

  // Формируем распределение по оценкам (5,4,3,2,1)
  // Можно пройтись циклом или использовать метод reduce / groupBy
  const distribution = {};
  for (let rating = 5; rating >= 1; rating--) {
    const count = feedbacks.filter(f => f.rating === rating).length;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    distribution[rating] = {
      count,
      percentage
    };
  }

  const rating = totalCount
    ? Number((feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / totalCount).toFixed(1))
    : 0;

  const sort = {
    newest: (data) => {
      return [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    low_rating: (data) => {
      return [...data].sort((a, b) => a.rating - b.rating);
    },
    high_rating: (data) => {
      return [...data].sort((a, b) => b.rating - a.rating);
    }
  };

  feedbacks = req.query.sort ? sort[req.query.sort](feedbacks) : feedbacks

  res.locals.paginationTarget = 'feedbacks';

  res.json({ feedbacks, distribution, rating })
}

