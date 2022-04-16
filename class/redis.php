<?php
// Class_CodyRedis

class CodyRedis
{
    protected $redis;
    public $host;
    public $port;
    private $auth;

    function __construct($host = "127.0.0.1", $port = 6379, $auth = NULL)
    {
        $this->host = $host;
        $this->port = $port;
        $this->auth = $auth;

        $this->redis = new Redis;
        $this->redis->connect($this->host, $this->port);
        if ($this->auth != NULL) {
            $this->redis->auth($this->auth);
        }
    }

    function ping()
    {
        return $this->redis->ping();
    }

    function get($key)
    {
        return $this->redis->get($key);
    }

    function set($key, $value)
    {
        return $this->redis->set($key, $value);
    }

    function setex($key, $value, $ttl)
    {
        return $this->redis->setex($key, $ttl, $value);
    }

    function setnx($key, $value)
    {
        return $this->redis->setnx($key, $value);
    }

    function delete($key)
    {
        return $this->redis->del($key);
    }

    function ttl($key)
    {
        return $this->redis->ttl($key);
    }

    function expire($key, $ttl)
    {
        return $this->redis->expire($key, $ttl);
    }
}
