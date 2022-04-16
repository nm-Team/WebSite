<?php
// Class_CodySession

function randSessionID()
{
    return md5(uniqid(microtime(true), mt_rand(0, 63)));
}

class CodySession
{
    protected $redis;
    public $sessionID;
    public $data = array();
    public $ttl;
    private $unset = false;

    function __construct($sessionID, CodyRedis $redis, $ttl = NULL)
    {
        $this->redis = $redis;
        $this->sessionID = $sessionID;
        $ret = $this->redis->get("CodySESSION:" . $this->sessionID);
        if ($ret != false) {
            $this->data = json_decode($ret, true);
            if ($ttl == NULL) {
                if (isset($this->data['ttl'])) {
                    $this->ttl = $this->data['ttl'];
                } else {
                    $this->ttl = 86400;
                    $this->data['ttl'] = $this->ttl;
                }
            } else {
                $this->ttl = $ttl;
                $this->data['ttl'] = $this->ttl;
            }
        } else {
            $this->ttl = $ttl == NULL ? 86400 : $ttl;
            $this->data['ttl'] = $this->ttl;
            $this->redis->setex("CodySESSION:" . $this->sessionID, "", $this->ttl);
        }
    }

    function unset()
    {
        $this->unset = true;
    }

    function close()
    {
        if (!$this->unset) {
            $json = json_encode($this->data);
            $this->redis->setex("CodySESSION:" . $this->sessionID, $json, $this->ttl);
        } else {
            $this->redis->delete("CodySESSION:" . $this->sessionID);
        }
    }
    function __destruct()
    {
        $this->close();
    }
}
