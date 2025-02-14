const express = require('express');
var cors = require('cors');
const oracledb = require('oracledb'); // Oracle DB 사용을 위한 패키지
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); 

// Oracle DB 연결 설정
const dbConfig = {
  user: 'system',
  password: 'test1234',
  connectString: 'localhost:1521/orcl'  
};

async function connectToDB() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log('Oracle DB 연결 성공!');
    return connection;
  } catch (err) {
    console.error('DB 연결 실패:', err);
    return null;
  }
}

// 기본 경로
app.get('/', function (req, res) {
  res.send('Hello World');
});

// 로그인 API
app.post('/login', async (req, res) => {
  console.log(req.body);
  const { id, pwd } = req.body;  // 클라이언트에서 보낸 데이터

  if (!id || !pwd) {
    return res.status(400).send({ msg: '아이디와 비밀번호를 입력해주세요.' });
  }

  try {
    const connection = await connectToDB();
    if (connection) {
      const result = await connection.execute(
        `SELECT * FROM TBL_USER WHERE USERID = :id AND PASSWORD = :pwd`,
        [id, pwd], // :id, :pwd 바인딩 변수
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length > 0) {
        // 로그인 성공
        res.send({ msg: 'success', user: result.rows[0] });
      } else {
        // 로그인 실패
        res.send({ msg: 'fail' });
      }

      await connection.close();
    } else {
      res.status(500).send({ msg: 'DB 연결 실패' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: '로그인 중 오류가 발생했습니다.' });
  }
});

app.post('/list', async (req, res) => {
  const {} = req.body;  // 클라이언트에서 보낸 데이터
  try {
    const connection = await connectToDB();
    if (connection) {
      const result = await connection.execute(
        `SELECT * FROM STUDENT`,
        [], 
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      res.send({ msg: 'success', list : result.rows });
      await connection.close();
    } else {
      res.status(500).send({ msg: 'DB 연결 실패' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: '로그인 중 오류가 발생했습니다.' });
  }
});

app.post('/remove', async (req, res) => {
  console.log(req.body);
  const { stuNo } = req.body;  // 클라이언트에서 보낸 데이터
  try {
    const connection = await connectToDB();
    if (connection) {
      const result = await connection.execute(
        `DELETE FROM STUDENT WHERE STU_NO = :stuNo`,
        [stuNo], 
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      await connection.commit();
      res.send({ msg: 'success'});
      await connection.close();
    } else {
      res.status(500).send({ msg: 'DB 연결 실패' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: '로그인 중 오류가 발생했습니다.' });
  }
});



app.listen(3000, () => {
  console.log('서버가 3000 포트에서 실행 중입니다.');
});
